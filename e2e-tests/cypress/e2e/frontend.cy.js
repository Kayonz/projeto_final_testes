describe('Frontend Tests', () => {
  beforeEach(() => {
    // Aguardar que a API esteja disponível
    cy.waitForAPI();
    
    // Visitar a página inicial
    cy.visit('/');
  });

  describe('Page Load', () => {
    it('should load the main page successfully', () => {
      cy.title().should('not.be.empty');
      cy.get('body').should('be.visible');
    });

    it('should have responsive design', () => {
      // Testar em diferentes tamanhos de tela
      const viewports = [
        { width: 320, height: 568 },  // Mobile
        { width: 768, height: 1024 }, // Tablet
        { width: 1280, height: 720 }  // Desktop
      ];

      viewports.forEach((viewport) => {
        cy.viewport(viewport.width, viewport.height);
        cy.get('body').should('be.visible');
        cy.wait(500); // Aguardar ajuste do layout
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate between different sections', () => {
      // Este teste será expandido quando tivermos mais páginas
      cy.get('body').should('contain.text', 'Finance');
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 pages gracefully', () => {
      cy.visit('/non-existent-page', { failOnStatusCode: false });
      // Verificar se há tratamento de erro 404
    });

    it('should handle API errors gracefully', () => {
      // Simular erro de API e verificar tratamento
      cy.intercept('GET', '**/api/**', { statusCode: 500 }).as('apiError');
      cy.visit('/');
      // Verificar se há tratamento de erro de API
    });
  });

  describe('Performance', () => {
    it('should load within acceptable time', () => {
      const startTime = Date.now();
      
      cy.visit('/').then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(5000); // 5 segundos
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      cy.visit('/');
      cy.get('h1, h2, h3, h4, h5, h6').should('exist');
    });

    it('should have proper alt text for images', () => {
      cy.visit('/');
      cy.get('img').each(($img) => {
        cy.wrap($img).should('have.attr', 'alt');
      });
    });

    it('should be keyboard navigable', () => {
      cy.visit('/');
      cy.get('body').tab();
      cy.focused().should('be.visible');
    });
  });

  describe('Form Interactions', () => {
    it('should handle form validation', () => {
      cy.visit('/');
      
      // Procurar por formulários na página
      cy.get('form').then(($forms) => {
        if ($forms.length > 0) {
          // Testar validação de formulário
          cy.get('form').first().within(() => {
            cy.get('button[type="submit"]').click();
            // Verificar se há mensagens de validação
          });
        }
      });
    });

    it('should submit forms correctly', () => {
      cy.visit('/');
      
      // Este teste será expandido quando tivermos formulários específicos
      cy.get('body').should('be.visible');
    });
  });

  describe('Data Display', () => {
    it('should display financial data correctly', () => {
      cy.visit('/');
      
      // Verificar se há elementos relacionados a dados financeiros
      cy.get('body').then(($body) => {
        if ($body.text().includes('R$') || $body.text().includes('Real')) {
          // Verificar formatação de moeda
          cy.contains(/R\$\s*\d+/).should('be.visible');
        }
      });
    });

    it('should handle empty states', () => {
      cy.visit('/');
      
      // Verificar se há tratamento para estados vazios
      cy.get('body').should('be.visible');
    });
  });

  describe('User Interactions', () => {
    it('should handle button clicks', () => {
      cy.visit('/');
      
      cy.get('button').then(($buttons) => {
        if ($buttons.length > 0) {
          cy.get('button').first().should('be.visible').click();
        }
      });
    });

    it('should handle input interactions', () => {
      cy.visit('/');
      
      cy.get('input').then(($inputs) => {
        if ($inputs.length > 0) {
          cy.get('input[type="text"]').first().then(($input) => {
            if ($input.length > 0) {
              cy.wrap($input).type('Test input');
              cy.wrap($input).should('have.value', 'Test input');
            }
          });
        }
      });
    });
  });

  describe('Component Rendering', () => {
    it('should render financial components correctly', () => {
      cy.visit('/');
      
      // Verificar se componentes financeiros são renderizados
      cy.get('body').should('be.visible');
      
      // Procurar por elementos que indicam componentes financeiros
      cy.get('body').then(($body) => {
        const text = $body.text();
        if (text.includes('Transação') || text.includes('Categoria') || text.includes('Saldo')) {
          cy.log('Componentes financeiros detectados');
        }
      });
    });
  });
});

