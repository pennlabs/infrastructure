data "aws_availability_zones" "available" {}

module "vpc" {
  // https://registry.terraform.io/modules/terraform-aws-modules/vpc/aws/latest
  source  = "terraform-aws-modules/vpc/aws"
  version = "3.11.0"

  name = "vpc"
  cidr = "10.0.0.0/16"
  azs  = data.aws_availability_zones.available.names
  # Generate 6 non-overlapping subnets for our VPC
  # The 4 here represents that we want to create subnets of size: vpc subnet mask + 4
  # = 16 + 4 = 20. This results in 2^(32-20)=2^12=4096 IPs per subnet.
  private_subnets      = [for offset in [0, 1, 2] : cidrsubnet(local.vpc_cidr, 4, offset)]
  public_subnets       = [for offset in [3, 4, 5] : cidrsubnet(local.vpc_cidr, 4, offset)]
  enable_nat_gateway   = true
  single_nat_gateway   = true
  enable_dns_hostnames = true

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
