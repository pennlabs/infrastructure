// module "production-cluster" {
//   source           = "../modules/cluster"
//   name             = "production"
//   k8s_node_count   = 5
//   mysql_node_count = 1
//   mysql_users = ["vault"]
// }

module "staging-cluster" {
  source           = "../modules/cluster"
  name             = "staging"
  k8s_node_count   = 1
  k8s_node_size    = "s-1vcpu-2gb"
  mysql_node_count = 1
  mysql_users      = ["vault"]
  pgp_key          = ""
  providers = {
    helm  = helm.staging
    mysql = mysql.staging
  }
}
