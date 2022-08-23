package main

import (
	"context"
	"log"
	"net/http"

	"github.com/aspecto-io/opentelemetry-examples/tracing"

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
	startWebServer()
}

func connectMongo() {
	opts := options.Client()

	//mongo OTEL instrumentation
	opts.Monitor = otelmongo.NewMonitor()
	opts.ApplyURI("mongodb://localhost:27017")
	client, _ = mongo.Connect(context.Background(), opts)

	//seed the database with some todo's
	docs := []interface{}{
		bson.D{{"id", "1"}, {"title", "Buy groceries"}},
		bson.D{{"id", "2"}, {"title", "install Aspecto.io"}},
		bson.D{{"id", "3"}, {"title", "Buy dogz.io domain"}},
	}
	client.Database("todo").Collection("todos").InsertMany(context.Background(), docs)
}

func startWebServer() {
	r := gin.Default()

	//gin OTEL instrumentation
	r.Use(otelgin.Middleware("todo-service"))

	r.GET("/todo", func(c *gin.Context) {
		collection := client.Database("todo").Collection("todos")

		//make sure to pass c.Request.Context() as the context and not c itself
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
