resource "aws_sqs_queue" "order_queue" {
  name = "orderQueue"
}

resource "aws_lambda_event_source_mapping" "event_source_mapping" {
  batch_size        = 1
  event_source_arn  = aws_sqs_queue.order_queue.arn
  enabled           = true
  function_name     = aws_lambda_function.process_order_lambda.arn
}