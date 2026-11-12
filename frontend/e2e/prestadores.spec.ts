import { test, expect } from '@playwright/test';

test.describe('Módulo 1: Prestadores (E2E Frontend)', () => {
    test.describe.configure({ mode: 'serial' });

    test('permite navegar a la sección de Prestadores desde el menú lateral y visualizar el catálogo paginado', async ({
        page,
    }) => {
        await page.goto('/');

        const linkPrestadores = page.getByRole('link', {
            name: /1\. Prestadores/i,
        });
        await expect(linkPrestadores).toBeVisible();

        await linkPrestadores.click();

        await expect(page).toHaveURL(/\/prestadores$/);
        await expect(
            page.getByRole('heading', { name: /Módulo de Prestadores/i })
        ).toBeVisible();

        await expect(page.locator('table tbody tr')).toHaveCount(10);
        await expect(page.getByText('Total: 16 registros')).toBeVisible();

        // Verifica que prestadores sin foto (ej. Ana López, primera en orden alfabético) muestran la silueta
        const primeraFilaAvatar = page
            .locator('table tbody tr')
            .first()
            .getByTestId('avatar-prestador');
        await expect(primeraFilaAvatar).toHaveAttribute(
            'data-tiene-foto',
            'false'
        );
        await expect(primeraFilaAvatar.locator('img')).toHaveAttribute(
            'src',
            /^data:image\/svg\+xml/
        );
    });

    test('permite filtrar en tiempo real con el buscador, por rubro y cambiar la cantidad de filas por página', async ({
        page,
    }) => {
        await page.goto('/prestadores');
        await expect(page.locator('table tbody tr')).toHaveCount(10);

        // Selector de filas por página
        await page.locator('#filas-por-pagina').selectOption('5');
        await expect(page.locator('table tbody tr')).toHaveCount(5);
        await expect(page.getByText('Página 1 de 4')).toBeVisible();

        // Filtro por rubro
        await page.locator('#filtro-rubro').selectOption('Plomería');
        await expect(page.getByText('Total: 5 registros')).toBeVisible();
        await expect(page.locator('table tbody tr')).toHaveCount(5);

        // Búsqueda en tiempo real en el input
        const inputBusqueda = page.locator('input[type="text"]');
        await inputBusqueda.fill('Gómez');

        await expect(page.locator('table')).toContainText('Carlos Gómez');
        await expect(page.locator('table tbody tr')).toHaveCount(1);
    });

    test('permite acceder a la vista de detalle (/prestadores/:id) y visualizar la ficha técnica y formulario', async ({
        page,
    }) => {
        await page.goto('/prestadores');

        const inputBusqueda = page.locator('input[type="text"]');
        await inputBusqueda.fill('Gómez');
        await expect(page.locator('table')).toContainText('Carlos Gómez');

        await page.locator('table tbody tr').first().click();

        await expect(page).toHaveURL(/\/prestadores\/\d+$/);
        await expect(
            page.getByRole('heading', { name: /Detalle del prestador/i })
        ).toBeVisible();
        await expect(page.getByText('MAT-1001')).toBeVisible();
        await expect(page.getByText('+54 11 40001001')).toBeVisible();
        await expect(
            page.getByRole('button', { name: /Guardar cambios/i })
        ).toBeVisible();
    });

    test('permite dar de alta un prestador, editar su ficha en el detalle y eliminarlo', async ({
        page,
    }) => {
        await page.goto('/prestadores');

        await page
            .getByRole('button', { name: /\+ Nuevo Prestador/i })
            .click();

        await page.locator('#prestador-nombre').fill('Ramiro');
        await page.locator('#prestador-apellido').fill('Villalba');
        await page.locator('#prestador-rubro').selectOption('Gasista');
        await page.locator('#prestador-matricula').fill('MAT-7788');
        await page.locator('#prestador-experiencia').fill('11');
        await page.locator('#prestador-nro-telefono').fill('48889999');
        await page
            .locator('#prestador-foto-url')
            .fill('https://randomuser.me/api/portraits/men/90.jpg');
        await page
            .locator('#prestador-acerca')
            .fill('Especialista en planos y pruebas de hermeticidad');

        await page
            .getByRole('button', { name: /Registrar prestador/i })
            .click();

        await page.locator('#busqueda-prestadores').fill('Villalba');
        await expect(page.locator('table')).toContainText('Ramiro Villalba');
        await expect(
            page.locator('table tbody tr').first().getByTestId('avatar-prestador')
        ).toHaveAttribute('data-tiene-foto', 'true');

        await page.locator('table tbody tr').first().click();
        await expect(page).toHaveURL(/\/prestadores\/\d+$/);
        await expect(page.getByText('MAT-7788')).toBeVisible();
        await expect(
            page.locator('.prestador-ficha').getByTestId('avatar-prestador')
        ).toHaveAttribute('data-tiene-foto', 'true');

        // Quitar foto desde el formulario de edición y verificar que muestra la silueta de persona
        await page.getByRole('button', { name: /Quitar foto/i }).click();
        await page.locator('#prestador-experiencia').fill('14');
        await page.getByRole('button', { name: /Guardar cambios/i }).click();
        await expect(page.getByText('14 años')).toBeVisible();
        await expect(
            page.locator('.prestador-ficha').getByTestId('avatar-prestador')
        ).toHaveAttribute('data-tiene-foto', 'false');

        await page.getByRole('button', { name: /Eliminar prestador/i }).click();
        await expect(page).toHaveURL(/\/prestadores$/);
    });

    test('permite exportar el catálogo de prestadores en formatos .pdf y .xlsx', async ({
        page,
    }) => {
        await page.goto('/prestadores');
        await expect(page.locator('table tbody tr')).toHaveCount(10);

        const promesaDescargaPdf = page.waitForEvent('download');
        await page.getByRole('button', { name: /Exportar Catálogo/i }).click();
        const descargaPdf = await promesaDescargaPdf;
        expect(descargaPdf.suggestedFilename()).toBe(
            'catalogo-prestadores.pdf'
        );

        await page.locator('#formato-exportacion').selectOption('xlsx');
        const promesaDescargaXlsx = page.waitForEvent('download');
        await page.getByRole('button', { name: /Exportar Catálogo/i }).click();
        const descargaXlsx = await promesaDescargaXlsx;
        expect(descargaXlsx.suggestedFilename()).toBe(
            'catalogo-prestadores.xlsx'
        );
    });

    test('permite visualizar el catálogo de prestadores para el usuario con tarjetas, filtros rápidos y navegación al perfil', async ({
        page,
    }) => {
        await page.goto('/prestadores');

        await page.getByTestId('btn-alternar-vista-prestadores').click();

        await expect(
            page.getByTestId('catalogo-prestadores-usuario')
        ).toBeVisible();
        await expect(page.getByText('CRITERIO DE BÚSQUEDA')).toBeVisible();
        await expect(
            page.getByText(/Mostrando 16 profesionales disponibles/i)
        ).toBeVisible();

        // Verifica que se muestran 6 tarjetas por página (Página 1 de 3)
        const tarjetas = page.getByTestId('tarjeta-catalogo-prestador');
        await expect(tarjetas).toHaveCount(6);

        // Filtro por localidad en el catálogo público
        await page
            .getByTestId('filtro-localidad')
            .selectOption('Córdoba Capital');
        await expect(tarjetas).toHaveCount(4);

        // Filtro rápido de Mejor calificados (4.8+) y Matriculados
        await page.getByTestId('filtro-mejor-calificados').click();
        await page.getByTestId('filtro-matriculados').click();

        // Búsqueda en el catálogo de usuario
        await page.locator('#catalogo-busqueda-input').fill('Carlos');
        await expect(tarjetas).toHaveCount(1);
        await expect(tarjetas.first()).toContainText('Carlos Gómez');

        // Botón Contactar despliega el teléfono del profesional
        await tarjetas
            .first()
            .getByRole('button', { name: /Contactar/i })
            .click();
        await expect(tarjetas.first()).toContainText('+54 11 40001001');

        // Botón Ver Perfil navega al detalle del prestador
        await tarjetas
            .first()
            .getByRole('button', { name: /Ver Perfil/i })
            .click();
        await expect(page).toHaveURL(/\/prestadores\/1$/);
    });
});
