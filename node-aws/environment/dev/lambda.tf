resource "aws_lambda_function" "order_api" {
  function_name = "order_api"

  filename         = data.archive_file.lambdas_code.output_path
  source_code_hash = data.archive_file.lambdas_code.output_base64sha256

  role    = aws_iam_role.iam_for_lambda.arn
  handler = "order-api.handler"
  runtime = "nodejs12.x"
  timeout = 10
  
  environment {
    variables = {
      ASPECTO_API_KEY = var.ASPECTO_API_KEY
      SQS_URL = aws_sqs_queue.order_queue.id
      DDB_TABLE_NAME = aws_dynamodb_table.order_table.name
      SERVICE_NAME = "order_api"
    }
  }
}

resource "aws_lambda_function" "process_order_lambda" {
  function_name = "process_order"

  filename         = data.archive_file.lambdas_code.output_path
  source_code_hash = data.archive_file.lambdas_code.output_base64sha256

  role    = aws_iam_role.iam_for_lambda.arn
  handler = "process-order.handler"
  runtime = "nodejs12.x"
  timeout = 10
  
  environment {
    variables = {
      ASPECTO_API_KEY = var.ASPECTO_API_KEY
      SQS_URL = aws_sqs_queue.order_queue.id
      DDB_TABLE_NAME = aws_dynamodb_table.order_table.name
      SERVICE_NAME = "process_order"
    }
  }
}

data "archive_file" "lambdas_code" {
  type        = "zip"
  output_path = "${path.module}/lambdas.zip"
  source_dir  = "${path.module}/../../lambdas"
}

resource "aws_cloudwatch_log_group" "order_api_logs" {
  name              = "/aws/lambda/${aws_lambda_function.order_api.function_name}"
  retention_in_days = 14
}

resource "aws_cloudwatch_log_group" "process_order_logs" {
  name              = "/aws/lambda/${aws_lambda_function.process_order_lambda.function_name}"
  retention_in_days = 14
}
