output "base_url" {
  description = "Base URL for API Gateway stage."
  value = aws_apigatewayv2_stage.lambda.invoke_url
}

output "sqs_url" {
  value = aws_sqs_queue.order_queue.id
}