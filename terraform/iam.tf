module "iam-products" {
  for_each          = local.products
  source            = "./modules/iam"
  role              = each.key
  oidc_issuer_url   = module.eks-production.cluster_oidc_issuer_url
  oidc_provider_arn = module.eks-production.oidc_provider_arn
}
