module "iam-products" {
  for_each          = local.iam_service_accounts
  source            = "./modules/iam"
  role              = each.key
  oidc_issuer_url   = module.eks-production.cluster_oidc_issuer_url
  oidc_provider_arn = module.eks-production.oidc_provider_arn
}

module "iam-secret-sync" {
  source            = "./modules/iam"
  role              = "secret-sync"
  namespaces        = ["default", "monitoring"]
  oidc_issuer_url   = module.eks-production.cluster_oidc_issuer_url
  oidc_provider_arn = module.eks-production.oidc_provider_arn
}

module "iam-cert-manager" {
  source            = "./modules/iam"
  role              = "cert-manager"
  namespaces        = ["cert-manager"]
  oidc_issuer_url   = module.eks-production.cluster_oidc_issuer_url
  oidc_provider_arn = module.eks-production.oidc_provider_arn
}
