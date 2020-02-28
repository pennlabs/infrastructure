# Resources
resource "aws_s3_bucket" "ghost_static" {
  bucket = "ghost-labs-static"

  tags = {
    created-by = "terraform"
  }
}

resource "aws_iam_user" "ghost-user" {
  name = "ghost-user"

  tags = {
    created-by = "terraform"
  }
}

resource "aws_iam_access_key" "ghost-user" {
  user = aws_iam_user.ghost-user.name
}

resource "aws_iam_user_policy" "ghost-policy" {
  name = "ghost-policy"
  user = aws_iam_user.ghost-user.name

  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": "s3:ListBucket",
            "Resource": "arn:aws:s3:::${aws_s3_bucket.ghost_static.bucket}"
        },
        {
            "Sid": "VisualEditor1",
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:PutObjectVersionAcl",
                "s3:DeleteObject",
                "s3:PutObjectAcl"
            ],
            "Resource": "arn:aws:s3:::${aws_s3_bucket.ghost_static.bucket}/*"
        }
    ]
}
EOF
}


# Outputs
output "GHOST_AWS_ACCESS_KEY_ID" {
  sensitive   = true
  value = aws_iam_access_key.ghost-user.id
}

output "GHOST_AWS_SECRET_ACCESS_KEY" {
  sensitive   = true
  value = aws_iam_access_key.ghost-user.secret
}

output "GHOST_STORAGE_ADAPTER_S3_PATH_BUCKET" {
  sensitive   = true
  value = aws_s3_bucket.ghost_static.bucket
}
