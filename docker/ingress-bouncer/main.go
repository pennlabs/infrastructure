package main

import (
	"crypto/tls"
	"net"
	"os"
	"time"

	log "github.com/sirupsen/logrus"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/api/extensions/v1beta1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
)

func main() {
	svcName := os.Getenv("INGRESS_SVC_NAME")
	if svcName == "" {
		log.Fatalln("Set INGRESS_SVC_NAME to the name of your LoadBalancer service")
	}
	svcNamespace := os.Getenv("INGRESS_SVC_NS")
	if svcNamespace == "" {
		log.Fatalln("Set INGRESS_SVC_NS to the namespace of your LoadBalancer service")
	}

	config, err := rest.InClusterConfig()
	if err != nil {
		log.Fatalln(err)
	}
	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		log.Fatalln(err)
	}

	for {
		lbsvc, err := clientset.CoreV1().Services(svcNamespace).Get(svcName, metav1.GetOptions{})
		if err != nil {
			log.Fatalf("Could not get service %s/%s: %v\n", svcNamespace, svcName, err)
		}
		svcType := lbsvc.Spec.Type
		if svcType != corev1.ServiceTypeLoadBalancer {
			log.Fatalf("Expected LoadBalancer service type for service %s/%s but got %s.\n", lbsvc.Namespace, lbsvc.Name, svcType)
		}
		lbstatus := lbsvc.Status.LoadBalancer.Ingress
		if len(lbstatus) != 1 {
			log.Fatalf("Expected exactly one ip for load balancer but got %d.\n", len(lbstatus))
		}
		ip := lbstatus[0].IP

		ingresses, err := clientset.ExtensionsV1beta1().Ingresses("").List(metav1.ListOptions{})
		if err != nil {
			log.Fatalf("Could not list ingresses: %v\n", err)
		}

		for _, ingress := range ingresses.Items {
			bounce := false
			for _, rule := range ingress.Spec.Rules {
				host := rule.Host

				if found, err := ipHost(host, ip); err != nil || !found {
					log.Infof("%s does not resolve to %s.\n", host, ip)
					continue
				}

				conn, err := tls.Dial("tcp", host+":443", nil)
				if err != nil {
					bounce = true
					break
				}
				conn.Close()
			}
			if bounce {
				err = bounceIngress(ingress, clientset)
				if err != nil {
					log.Errorf("Error bouncing ingress %s in namespace %s. Cluster may be in inconsistent state: %v\n", ingress.Name, ingress.Namespace, err)
				} else {
					log.Infof("Successfully bounced ingress %s in namespace %s.\n", ingress.Name, ingress.Namespace)
				}
			}
		}

		log.Infof("Sleeping at time %s for 5 minutes\n", time.Now().String())
		time.Sleep(5 * time.Minute)
	}
}

func ipHost(host, desiredIP string) (bool, error) {
	ips, err := net.LookupIP(host)
	if err != nil {
		return false, err
	}

	for _, ip := range ips {
		if ip.String() == desiredIP {
			return true, nil
		}
	}

	return false, nil
}

func bounceIngress(ingress v1beta1.Ingress, clientset *kubernetes.Clientset) error {
	err := clientset.ExtensionsV1beta1().Ingresses(ingress.Namespace).Delete(ingress.Name, &metav1.DeleteOptions{})
	if err != nil {
		return err
	}

	ingress.ResourceVersion = ""
	ingress.UID = ""
	ingress.SelfLink = ""
	ingress.Generation = 0
	ingress.CreationTimestamp = metav1.Time{}
	ingress.Status = v1beta1.IngressStatus{}

	_, err = clientset.ExtensionsV1beta1().Ingresses(ingress.Namespace).Create(&ingress)
	if err != nil {
		return err
	}

	return nil
}
