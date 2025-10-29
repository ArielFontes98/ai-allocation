#!/bin/bash

# Script para configurar SSH e fazer push

cd /Users/ariel.fontes/ai-allocation

# Verificar se está no diretório correto
if [ ! -d ".git" ]; then
    echo "Erro: Não está em um repositório git"
    exit 1
fi

# Configurar remote para SSH
git remote set-url origin git@github.com:ArielFontes98/ai-allocation.git

# Verificar status
echo "Verificando status do repositório..."
git status

# Tentar fazer push
echo ""
echo "Tentando fazer push..."
echo "Se pedir senha ou autenticação, você precisará configurar SSH primeiro."
echo ""

git push origin main

# Verificar resultado
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Push realizado com sucesso!"
else
    echo ""
    echo "❌ Erro no push. Tentando configurar SSH..."
    echo ""
    echo "Para configurar SSH, execute estes comandos:"
    echo ""
    echo "1. Verificar se tem chave SSH:"
    echo "   ls -al ~/.ssh"
    echo ""
    echo "2. Se não tiver, gerar nova chave:"
    echo "   ssh-keygen -t ed25519 -C 'seu-email@exemplo.com'"
    echo ""
    echo "3. Adicionar chave ao ssh-agent:"
    echo "   eval \"\$(ssh-agent -s)\""
    echo "   ssh-add ~/.ssh/id_ed25519"
    echo ""
    echo "4. Copiar chave pública:"
    echo "   pbcopy < ~/.ssh/id_ed25519.pub"
    echo ""
    echo "5. Adicionar no GitHub: Settings > SSH and GPG keys > New SSH key"
    echo ""
    echo "6. Testar conexão:"
    echo "   ssh -T git@github.com"
    echo ""
fi



