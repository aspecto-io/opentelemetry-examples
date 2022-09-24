terraform {
  required_version = ">= 0.12"
}

variable "region" {
  type = string
  default = "us-east-1"
}

provider "aws" {
  region = var.region
}

provider "archive" {}


