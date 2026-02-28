import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true, // 启用原始请求体，用于微信支付回调验签
  })

  // 全局路由前缀
  app.setGlobalPrefix('v1')

  // 静态文件服务（上传的图片）
  app.useStaticAssets(join(__dirname, '..', '..', 'uploads'), {
    prefix: '/uploads/',
  })

  // 启用 CORS
  app.enableCors({
    origin: true,
    credentials: true,
  })

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  )

  // Swagger 文档配置
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('蜗壳小程序 API')
      .setDescription('蜗壳青年旅舍预订小程序后端接口文档')
      .setVersion('1.0')
      .addBearerAuth()
      .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('api-docs', app, document)
  }

  const port = process.env.PORT || 3000
  await app.listen(port)

  console.log(`🚀 Server is running on: http://localhost:${port}`)
  console.log(`📚 API Docs: http://localhost:${port}/api-docs`)
}

bootstrap()
