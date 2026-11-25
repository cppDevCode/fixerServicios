import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Routes, Route } from 'react-router-dom';
import { StaticRouter } from 'react-router-dom/server';
import { Layout } from '../../components/layout/Layout';
import { LoginPage } from '../../pages/LoginPage';
import { RegistroPage } from '../../pages/RegistroPage';

describe('Diseño compacto sin scroll en Login y Registro', () => {
    it('LoginPage no muestra el encabezado "Fixer" dentro de la tarjeta y mantiene el formulario completo', () => {
        const html = renderToStaticMarkup(
            createElement(
                StaticRouter,
                { location: '/login' },
                createElement(LoginPage)
            )
        );

        expect(html).not.toContain('auth-logo');
        expect(html).not.toContain('>Fixer</h1>');
        expect(html).toContain('Iniciar Sesión');
        expect(html).toContain('Soluciones para tu hogar');
    });

    it('RegistroPage no muestra el logo de texto "Fixer", conserva "Creá tu cuenta en Fixer" y agrupa campos en filas de 2 columnas', () => {
        const html = renderToStaticMarkup(
            createElement(
                StaticRouter,
                { location: '/registro' },
                createElement(RegistroPage)
            )
        );

        expect(html).not.toContain('auth-logo');
        expect(html).not.toContain('>Fixer</h1>');
        expect(html).toContain('Creá tu cuenta en Fixer');
        expect(html).toContain('class="form-row"');
    });

    it('Layout activa layout-container--auth en /login y /registro y no en la portada /', () => {
        const renderRuta = (ruta: string) =>
            renderToStaticMarkup(
                createElement(
                    StaticRouter,
                    { location: ruta },
                    createElement(
                        Routes,
                        null,
                        createElement(
                            Route,
                            { element: createElement(Layout) },
                            createElement(Route, {
                                path: '*',
                                element: createElement('div', null, 'contenido'),
                            })
                        )
                    )
                )
            );

        expect(renderRuta('/login')).toContain('layout-container--auth');
        expect(renderRuta('/registro')).toContain('layout-container--auth');
        expect(renderRuta('/recuperar-password')).toContain(
            'layout-container--auth'
        );
        expect(renderRuta('/')).not.toContain('layout-container--auth');
    });
});
