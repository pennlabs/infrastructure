data "aws_availability_zones" "available" {}

module "vpc" {
  // https://registry.terraform.io/modules/terraform-aws-modules/vpc/aws/latest
  source  = "terraform-aws-modules/vpc/aws"
  version = "3.11.0"

  name = "vpc"
  cidr = "10.0.0.0/16"
  azs  = data.aws_availability_zones.available.names
  # Generate 6 non-overlapping subnets for our VPC. This results in 2^(32-20)=2^12=4096 IPs per subnet.
  private_subnets         = ["10.0.0.0/20", "10.0.16.0/20", "10.0.32.0/20"]
  public_subnets          = ["10.0.48.0/20", "10.0.64.0/20", "10.0.80.0/20"]
  enable_nat_gateway      = true
  single_nat_gateway      = true
  enable_dns_hostnames    = true
  map_public_ip_on_launch = true

  tags = {
    created-by                                        = "terraform"
    "kubernetes.io/cluster/${local.k8s_cluster_name}" = "shared"
  }

  public_subnet_tags = {
    "kubernetes.io/cluster/${local.k8s_cluster_name}" = "shared"
    "kubernetes.io/role/elb"                          = "1"
  }

  private_subnet_tags = {
    "kubernetes.io/cluster/${local.k8s_cluster_name}" = "shared"
    "kubernetes.io/role/internal-elb"                 = "1"
  }
}
