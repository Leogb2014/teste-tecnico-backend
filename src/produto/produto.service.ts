import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CompraProdutoDto } from './dto/compra-produto.dto';
import { VendaProdutoDto } from './dto/venda-produto.dto';
import { Operacao, Produto } from '@prisma/client';

@Injectable()
export class ProdutoService {
  constructor(private prisma: PrismaService) {}

  async buscarTodos(): Promise<Produto[]> {
    //método que retorna todos os produtos com status ativo (true)
    const produtos = await this.prisma.produto.findMany({ where: { status: true } });
    if (!produtos) throw new InternalServerErrorException('Não foi possível buscar os produtos.');
    return produtos;
  }

  async criar(createProdutoDto: CreateProdutoDto): Promise<Produto> {
    const produto = await this.prisma.produto.create({ data: createProdutoDto });
    if(!produto){
      throw new InternalServerErrorException('Não foi possível adicionar o produto');
    }
    return produto;
  }

  async buscarPorId(id: number): Promise<Produto> {
    const produto = await this.prisma.produto.findUnique({ where: { id }, include: { operacoes: true } });
    if(!produto){
      throw new InternalServerErrorException('Não foi possível buscar o produto.');
    }
    return produto;
  }

  async atualizar(id: number, updateProdutoDto: UpdateProdutoDto): Promise<Produto> {
    try {
      const produto = await this.prisma.produto.update({ where: { id }, data: updateProdutoDto})
      return produto;
    } catch (error) {
      throw new InternalServerErrorException('Não foi possível atualizar o produto');
    }   
  }

  async desativar(id: number): Promise<Produto> {
    const encontraProduto = await this.prisma.produto.findUnique({ where: { id, status: true} })
    if(!encontraProduto){
      throw new InternalServerErrorException('Não foi possível desativar o produto');
    }
    const produto = await this.prisma.produto.update({ where: { id }, data: {status: false} })
    return produto;
  }

  async comprarProdutos(id: number, compraProdutoDto: CompraProdutoDto): Promise<Operacao> {
    const produto = await this.prisma.produto.findUnique({ where: { id, status: true} });
    if(!produto) {
      throw new InternalServerErrorException("Produto não encontrado");
    }
    const tipo = 1;
    const lucro = 0.5;
    const precoVenda = compraProdutoDto.preco + (compraProdutoDto.preco * lucro);
    const precoVendaArredondado = Math.round(precoVenda * 100) / 100;
    const quantidadeAtualizada = produto.quantidade + compraProdutoDto.quantidade;
    const totalCompra = compraProdutoDto.preco * compraProdutoDto.quantidade;
    if(precoVenda > produto.precoVenda ) {
      await this.prisma.produto.update({ where: { id }, data: { precoVenda: precoVendaArredondado, precoCompra: compraProdutoDto.preco}  });
    }
    const operacao = await this.prisma.operacao.create({ data: { ...compraProdutoDto, tipo: tipo, total: totalCompra, produtoId: id }})
    const operacaoRetorna = await this.prisma.operacao.findUnique({ where: {id: operacao.id}, include: { produto: true }})
    await this.prisma.produto.update({where: {id}, data: { quantidade: quantidadeAtualizada }});
    if(!operacao){
      throw new InternalServerErrorException('Não foi possível realizar a operação');
    }
    return operacaoRetorna;
    
  }

  async venderProdutos(id: number, vendaProduto: VendaProdutoDto): Promise<Operacao> {
    const produto = await this.prisma.produto.findUnique({ where: {id, status: true}})
    if(!produto) {
      throw new InternalServerErrorException("Produto não encontrado");
    }
    const totalVenda = produto.precoVenda * vendaProduto.quantidade;
    const tipo = 2;
    const quantidadeAtualizada = produto.quantidade - vendaProduto.quantidade;
    await this.prisma.produto.update({where: {id}, data: { quantidade: quantidadeAtualizada }});
    if(produto.quantidade == 0){
      await this.prisma.produto.update({where: {id}, data: { precoVenda: 0, precoCompra: 0 }});
    }
    const operacao = await this.prisma.operacao.create({ data: {...vendaProduto, tipo: tipo, total: totalVenda, preco: produto.precoVenda, produtoId: id}});
    const operacaoRetorna = await this.prisma.operacao.findUnique({ where: {id: operacao.id}, include: { produto: true }});
    if(!operacao){
      throw new InternalServerErrorException("Não foi possível realizar a operação");
    }
    return operacaoRetorna;
  }
}
