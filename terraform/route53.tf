module "domains" {
  source          = "./modules/domain"
  for_each        = local.domains
  domain          = each.key
  traefik_lb_name = data.aws_elb.traefik.dns_name
  traefik_zone_id = data.aws_elb.traefik.zone_id
}

data "aws_elb" "traefik" {
  name = local.traefik_lb_name
}
