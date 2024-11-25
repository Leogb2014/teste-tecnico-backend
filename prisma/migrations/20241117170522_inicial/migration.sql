-- CreateTable
CREATE TABLE "produtos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "precoCompra" REAL,
    "precoVenda" REAL,
    "quantidade" INTEGER DEFAULT 0,
    "status" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "operacoes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "data" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "quantidade" INTEGER NOT NULL,
    "preco" REAL NOT NULL,
    "total" REAL NOT NULL,
    "tipo" INTEGER NOT NULL,
    "produtoId" INTEGER NOT NULL,
    CONSTRAINT "operacoes_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "produtos_nome_key" ON "produtos"("nome");
