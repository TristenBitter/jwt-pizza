# AWS Lambda vs Cloudflare Workers vs Deno Deploy

### Introduction

      Serverless runtimes have become one of the most important shifts in modern backend development. AWS Lambda has been the industry standard for nearly a decade, but newer edge-focused platforms like Cloudflare Workers and Deno Deploy have pushed expectations for speed, cold start performance, and global distribution.
      For this report, I wanted to understand how these three runtimes compare in terms of performance, developer experience, security, and real-world use cases. I set up small test deployments for each runtime and reviewed official benchmarks to see how they compare.

-------------------------------------------------------------------------------------------
### Definitions
<u>__Cold Start__</u>:  A cold start is when a serverless function has to “wake up” before it can respond. This happens when the platform needs to start a new instance of your code, which adds a small delay to the first request.

<u>__V8 Isolates__</u>:  V8 isolates are lightweight, sandboxed environments used by Cloudflare Workers and Deno Deploy to run JavaScript. They start almost instantly, which is why these platforms have very fast cold start times.

<u>__MicroVMs__</u> (Firecracker):  AWS Lambda uses micro virtual machines (microVMs) built with Firecracker. They are more secure and isolated but slower to start, which leads to longer cold starts compared to V8 isolates.

<u>__Edge Computing__</u>: Edge computing means running your code on servers that are physically close to users around the world. This reduces latency and makes applications feel faster.

-------------------------------------------------------------------------------------------
### Quick Comparison Table
| Feature | AWS Lambda | Cloudflare Workers | Deno Deploy |
| :------- | :------: | -------: | -------: |
| Runtime Model | Firecracker micro-VMs | V8 isolates | V8 isolates (Deno runtime) |
| Cold Start Speed | Slowest | Fastest | Very fast |
| Global Distribution | Regional by default | Global (300+ PoPs) | Global |
| Native TypeScript | No | Yes | Yes |
| Max Execution Time | Up to 15 minutes | ~30 seconds | ~30 seconds |
| Memory Limit | Up to 10 GB | ~128 MB | ~150 MB |
| Cost Model | Pay per duration & memory | Pay per request | Pay per request |
| Best Strength | Deep AWS integration | Latency & speed | TypeScript-first |
| Released | 2014 | 2017 | 2021 |

-------------------------------------------------------------------------------------------
    
### AWS Lambda
  Lambda is the most mature serverless platform and still the default choice for enterprise systems. It runs functions inside micro VMs built on top of Firecracker, which creates strong isolation but also introduces slower cold starts. Lambda integrates with almost every AWS service, like S3, DynamoDB, API Gateway, and can handle heavy workloads with large memory and long execution windows.
  * In practice, Lambda feels more “ops-heavy” than the newer runtimes.
  * TypeScript requires a build step, deployments require bundling or container images, and you spend more time dealing with IAM and CloudWatch logs.
  * The trade-off is reliability and flexibility. If a project already lives inside AWS, Lambda remains a proven option.

-------------------------------------------------------------------------------------------
### Cloudflare Workers
   Cloudflare Workers use V8 isolates, the same technology browsers use to sandbox JavaScript. This allows Workers to start almost instantly, having almost no cold start, and run close to users around the world through Cloudflare’s network. Workers also ship with a growing set of storage options like KV, Durable Objects, R2, and D1.

* The developer experience is very modern.
* TypeScript works out of the box, deploying is a single command, and the platform encourages small, fast edge services.
* Workers aren’t ideal for heavy CPU tasks or long-running operations, but for APIs, authentication, caching layers, and global web applications, they’re incredibly fast.
-------------------------------------------------------------------------------------------
### Deno Deploy
-------------------------------------------------------------------------------------------
### Example Code

AWS Lambda 

    exports.handler = async (event) => {
      return {
        statusCode: 200,
        body: "Hello from AWS Lambda"
      };
    };

Cloudflare Worker
    
    export default {
      async fetch(request) {
        return new Response("Hello from Cloudflare Workers");
      }
    };

Deno Deploy 
    
    addEventListener("fetch", (event) => {
      event.respondWith(new Response("Hello from Deno Deploy"));
    });
-------------------------------------------------------------------------------------------

### Performance Comparison
-------------------------------------------------------------------------------------------
### Future Trends
-------------------------------------------------------------------------------------------
### Conclusion
-------------------------------------------------------------------------------------------
