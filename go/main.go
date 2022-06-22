package main

import (
	"context"
	"log"
	"net/http"

	"github.com/aspecto-io/opentelemerty-examples/tracing"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin"
	"go.opentelemetry.io/contrib/instrumentation/go.mongodb.org/mongo-driver/mongo/otelmongo"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/propagation"
)

var client *mongo.Client

func main() {
	tp, tpErr := tracing.AspectoTraceProvider()
	if tpErr != nil {
		log.Fatal(tpErr)
	}
	otel.SetTracerProvider(tp)
	otel.SetTextMapPropagator(propagation.NewCompositeTextMapPropagator(propagation.TraceContext{}, propagation.Baggage{}))
	connectMongo()
	setupWebServer()
}

func connectMongo() {
	opts := options.Client()

	//mongo OTEL instrumentation
	opts.Monitor = otelmongo.NewMonitor()
	opts.ApplyURI("mongodb://localhost:27017")
	client, _ = mongo.Connect(context.Background(), opts)
}

func setupWebServer() {
	r := gin.Default()

	//gin OTEL instrumentation
	r.Use(otelgin.Middleware("todo-service"))
	r.GET("/todo", func(c *gin.Context) {
		collection := client.Database("todo").Collection("todos")
		cur, findErr := collection.Find(c.Request.Context(), bson.D{})
		if findErr != nil {
			c.AbortWithError(500, findErr)
			return
		}
		results := make([]interface{}, 0)
		curErr := cur.All(c, &results)
		if curErr != nil {
			c.AbortWithError(500, curErr)
			return
		}
		c.JSON(http.StatusOK, results)
	})
	_ = r.Run(":8080")
}
