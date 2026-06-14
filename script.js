document.addEventListener('DOMContentLoaded', () => {
    // 1. Controle de Tema (Acessibilidade Visual)
    const btnTheme = document.getElementById('btn-theme');
    const htmlElement = document.documentElement;
    const currentTheme = localStorage.getItem('theme') || 'dark';
    
    htmlElement.setAttribute('data-theme', currentTheme);

    btnTheme.addEventListener('click', () => {
        const newTheme = htmlElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // 2. Controle de Fonte (Acessibilidade Cognitiva)
    const btnIncrease = document.getElementById('btn-font-increase');
    const btnDecrease = document.getElementById('btn-font-decrease');
    let currentFontSize = parseFloat(getComputedStyle(htmlElement).getPropertyValue('--font-base')) || 16;

    const setFontSize = (size) => {
        htmlElement.style.setProperty('--font-base', `${size}px`);
        localStorage.setItem('fontSize', size);
    };

    const savedSize = localStorage.getItem('fontSize');
    if (savedSize) setFontSize(parseFloat(savedSize));

    btnIncrease.addEventListener('click', () => setFontSize(Math.min(currentFontSize + 2, 24)));
    btnDecrease.addEventListener('click', () => setFontSize(Math.max(currentFontSize - 2, 12)));

    // 3. Motor de Busca e Renderização de Dados
    const feedContainer = document.getElementById('feed-container');
    const partnersContainer = document.getElementById('partners-container');
    const AD_FREQUENCY = 5; // Densidade Média

    Promise.all([
        fetch('dados.json').then(res => res.json()),
        fetch('parceiros.json').then(res => res.json())
    ])
    .then(([dados, parceiros]) => {
        renderFeed(dados);
        renderPartners(parceiros);
    })
    .catch(error => {
        feedContainer.innerHTML = '<p>Erro crítico ao carregar a curadoria. Verifique a conexão com o servidor de origem.</p>';
        console.error('Falha estrutural:', error);
    });

    function renderFeed(items) {
        items.forEach((item, index) => {
            const card = document.createElement('article');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-header">
                    <span class="emoji" aria-hidden="true">${item.emoji}</span>
                    <span class="card-category">${item.categoria}</span>
                </div>
                <h3>${item.nome}</h3>
                <p class="card-pain">Problema resolvido: ${item.dor_resolvida}</p>
                <p class="card-desc">${item.descricao}</p>
                <a href="${item.url}" class="btn-action" target="_blank" rel="noopener noreferrer">Acessar conteúdo</a>
                <button class="btn-share" data-title="${item.nome}" data-url="${item.url}">Compartilhar</button>
            `;
            feedContainer.appendChild(card);

            // Injeção de AdSense (Prevenção de CLS via CSS)
            if ((index + 1) % AD_FREQUENCY === 0) {
                const adBlock = document.createElement('div');
                adBlock.className = 'area-adsense';
                adBlock.setAttribute('aria-label', 'Bloco de Publicidade');
                adBlock.innerHTML = '<span>Espaço Publicitário Reservado (Google AdSense)</span>';
                feedContainer.appendChild(adBlock);
            }
        });

        setupShareButtons();
    }

    function renderPartners(partners) {
        partners.forEach(partner => {
            const link = document.createElement('a');
            link.href = partner.url;
            link.className = 'partner-card';
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.innerHTML = `
                <span class="emoji" aria-hidden="true">${partner.emoji}</span>
                <span class="partner-name">${partner.nome}</span>
            `;
            partnersContainer.appendChild(link);
        });
    }

    // 4. Web Share API
    function setupShareButtons() {
        document.querySelectorAll('.btn-share').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const title = e.target.getAttribute('data-title');
                const url = e.target.getAttribute('data-url');
                
                if (navigator.share) {
                    try {
                        await navigator.share({ title, url });
                    } catch (err) {
                        console.log('Compartilhamento cancelado ou falhou.', err);
                    }
                } else {
                    navigator.clipboard.writeText(url);
                    e.target.textContent = 'Link Copiado!';
                    setTimeout(() => e.target.textContent = 'Compartilhar', 2000);
                }
            });
        });
    }
});