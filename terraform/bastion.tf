// IAM
resource "aws_iam_instance_profile" "bastion" {
  name = "bastion"
  role = aws_iam_role.kubectl.name
}

// EC2 Instance
resource "aws_instance" "bastion" {
  // Ubuntu 20.04 Server
  ami                    = "ami-042e8287309f5df03"
  instance_type          = "t3.nano"
  subnet_id              = module.vpc.public_subnets[0]
  vpc_security_group_ids = [aws_security_group.bastion.id]
  iam_instance_profile   = aws_iam_instance_profile.bastion.name
  key_name               = aws_key_pair.admin.key_name
  user_data = templatefile("files/bastion/user_data.sh", {
    CONTAIN_EXEC_ENTRY  = file("files/bastion/container_exec_entry.sh")
    CONTAIN_EXEC        = file("files/bastion/container_exec.sh")
    SSH_AUTHORIZED_KEYS = file("files/bastion/ssh_authorized_keys")
  })
  tags = {
    Name       = "Bastion"
    created-by = "terraform"
  }
}

resource "aws_security_group" "bastion" {
  name        = "bastion"
  description = "Allow TLS inbound traffic"
  vpc_id      = module.vpc.vpc_id

  // SSH
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  // Access to internet (can't restrict to just the cluster
  // because we need to download tools on first startup)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name       = "Bastion"
    created-by = "terraform"
  }
}
