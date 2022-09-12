resource "aws_lambda_function" "order_api" {
  function_name = "order_api"

  filename         = data.archive_file.lambdas_code.output_path
  source_code_hash = data.archive_file.lambdas_code.output_base64sha256

  role    = aws_iam_role.iam_for_lambda.arn
  handler = "index.handler"
  runtime = "nodejs12.x"
  timeout = 10
  
  environment {
    variables = {
      ASPECTO_API_KEY = var.ASPECTO_API_KEY
      SQS_URL = aws_sqs_queue.order_queue.id
      DDB_TABLE_NAME = aws_dynamodb_table.order_table.name
      NODE_OPTIONS =  "--require tracing.js"
    }
  }
}
data "archive_file" "lambdas_code" {
  type        = "zip"
  output_path = "${path.module}/dist.zip"
  source_dir  = "${path.module}/../../src/dist"
}

resource "aws_cloudwatch_log_group" "order_api_logs" {
  name              = "/aws/lambda/${aws_lambda_function.order_api.function_name}"
  retention_in_days = 14
}
