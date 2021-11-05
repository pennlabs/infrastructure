resource "aws_route53_zone" "domain" {
  name = var.domain
}

// resource "aws_route53_record" "acme-challenge" {
//   zone_id = aws_route53_zone.domain.zone_id
//   name    = "_acme-challenge"
//   type    = "CNAME"
//   ttl     = 3600
//   records = ["_acme-challenge.upenn.club."]
// }

resource "aws_route53_record" "apex-domain" {
  zone_id = aws_route53_zone.domain.zone_id
  name    = ""
  type    = "A"

  alias {
    name                   = var.traefik_lb_name
    zone_id                = var.traefik_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "wildcard" {
  zone_id = aws_route53_zone.domain.zone_id
  name    = "*"
  type    = "CNAME"
  ttl     = 3600
  records = [aws_route53_zone.domain.name]
}

resource "aws_route53_record" "spf" {
  zone_id = aws_route53_zone.domain.zone_id
  name    = ""
  type    = "TXT"
  ttl     = 3600
  records = ["v=spf1 include:mailgun.org ~all"]
}

resource "aws_route53_record" "mailgun" {
  zone_id = aws_route53_zone.domain.zone_id
  name    = "email"
  type    = "CNAME"
  ttl     = 3600
  records = ["mailgun.org."]
}

resource "aws_route53_record" "gmail" {
  zone_id = aws_route53_zone.domain.zone_id
  name    = ""
  type    = "MX"
  ttl     = 3600
  records = [
    "5 gmr-smtp-in.l.google.com.",
    "10 alt1.gmr-smtp-in.l.google.com.",
    "20 alt2.gmr-smtp-in.l.google.com.",
    "30 alt3.gmr-smtp-in.l.google.com.",
    "40 alt4.gmr-smtp-in.l.google.com.",
  ]
}
