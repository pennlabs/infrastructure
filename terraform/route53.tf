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

// Bastion
resource "aws_route53_record" "bastion" {
  zone_id = module.domains["pennlabs.org"].zone_id
  name    = "bastion"
  type    = "CNAME"
  ttl     = 3600
  records = [aws_instance.bastion.public_dns]
}


// Cert-Manager IAM
data "aws_iam_policy_document" "cert-manager-iam" {
  statement {
    actions = [
      "route53:GetChange",
    ]
    resources = ["arn:aws:route53:::change/*"]
  }
  statement {
    actions = [
      "route53:ChangeResourceRecordSets",
      "route53:ListResourceRecordSets",
    ]
    resources = ["arn:aws:route53:::hostedzone/*"]
  }
  statement {
    actions = [
      "route53:ListHostedZonesByName",
    ]
    resources = ["*"]
  }
}

resource "aws_iam_role_policy" "cert-manager-iam" {
  name = "iam"
  role = module.iam-cert-manager.role-id

  policy = data.aws_iam_policy_document.cert-manager-iam.json
}
