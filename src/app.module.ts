import { Module } from '@nestjs/common';
import { ProdutoModule } from './produto/produto.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [ProdutoModule, PrismaModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
