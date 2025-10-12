#!/bin/bash

# Script d'audit de sécurité local
# À exécuter avant chaque commit/PR

set -e

echo "🔒 Audit de Sécurité Frontend"
echo "=============================="
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# 1. Audit des dépendances
echo "📦 1. Audit des dépendances (pnpm audit)..."
if pnpm audit --audit-level=moderate; then
    echo -e "${GREEN}✅ Aucune vulnérabilité détectée${NC}"
else
    echo -e "${RED}❌ Vulnérabilités trouvées dans les dépendances${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 2. Recherche de secrets
echo "🔑 2. Recherche de secrets/credentials..."
if command -v gitleaks &> /dev/null; then
    if gitleaks detect --no-git; then
        echo -e "${GREEN}✅ Aucun secret détecté${NC}"
    else
        echo -e "${RED}❌ Secrets détectés dans le code${NC}"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${YELLOW}⚠️  gitleaks non installé (skip)${NC}"
fi
echo ""

# 3. Recherche de tokens en localStorage
echo "🔍 3. Recherche de tokens en localStorage..."
if grep -r "localStorage.*auth_bearer" src/ 2>/dev/null; then
    echo -e "${RED}❌ auth_bearer trouvé en localStorage (vulnérabilité XSS)${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ Aucun token JWT en localStorage${NC}"
fi
echo ""

# 4. Recherche d'appels directs au backend
echo "🌐 4. Vérification appels API..."
if grep -r "https://api.chanvre-vert.fr" src/ --exclude-dir=app/api 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Appels directs au backend détectés (devrait passer par BFF)${NC}"
else
    echo -e "${GREEN}✅ Tous les appels passent par le BFF${NC}"
fi
echo ""

# 5. Vérification dangerouslySetInnerHTML
echo "⚠️  5. Vérification dangerouslySetInnerHTML..."
dangerous_html=$(grep -r "dangerouslySetInnerHTML" src/ --include="*.tsx" --include="*.jsx" 2>/dev/null | wc -l)
if [ "$dangerous_html" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  ${dangerous_html} utilisations de dangerouslySetInnerHTML trouvées${NC}"
    echo "   Vérifier que DOMPurify est utilisé avant chaque utilisation"
    
    # Vérifier si DOMPurify est importé dans les mêmes fichiers
    if grep -r "import.*DOMPurify" src/components/RichTextRenderer/ 2>/dev/null; then
        echo -e "${GREEN}   ✅ DOMPurify est importé${NC}"
    else
        echo -e "${RED}   ❌ DOMPurify non trouvé${NC}"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${GREEN}✅ Aucun dangerouslySetInnerHTML${NC}"
fi
echo ""

# 6. Tests de sécurité
echo "🧪 6. Exécution des tests de sécurité..."
if pnpm test tests/security --passWithNoTests; then
    echo -e "${GREEN}✅ Tests de sécurité passés${NC}"
else
    echo -e "${RED}❌ Tests de sécurité échoués${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 7. ESLint
echo "🔧 7. ESLint (règles de sécurité)..."
if pnpm lint; then
    echo -e "${GREEN}✅ ESLint passé${NC}"
else
    echo -e "${RED}❌ Erreurs ESLint${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 8. TypeScript
echo "📘 8. Vérification TypeScript..."
if pnpm tsc --noEmit; then
    echo -e "${GREEN}✅ TypeScript OK${NC}"
else
    echo -e "${RED}❌ Erreurs TypeScript${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 9. Vérification configuration sécurité
echo "⚙️  9. Vérification configuration..."

# Next.config headers
if grep -q "Content-Security-Policy" next.config.js; then
    echo -e "${GREEN}✅ CSP configuré${NC}"
else
    echo -e "${RED}❌ CSP manquant dans next.config.js${NC}"
    ERRORS=$((ERRORS + 1))
fi

# HttpOnly cookies
if grep -q "httpOnly: true" src/app/api/auth/login/route.ts; then
    echo -e "${GREEN}✅ Cookies HttpOnly configurés${NC}"
else
    echo -e "${RED}❌ Cookies HttpOnly manquants${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# Résumé
echo "=============================="
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ Audit de sécurité réussi!${NC}"
    echo "Aucun problème de sécurité détecté."
    exit 0
else
    echo -e "${RED}❌ Audit de sécurité échoué avec ${ERRORS} erreur(s)${NC}"
    echo "Corrigez les problèmes avant de commiter."
    exit 1
fi

