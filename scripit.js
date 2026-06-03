document.addEventListener("DOMContentLoaded", () => {
    
    /* ==========================================================================
       1. MECANISMO DO ACCORDION (SEÇÕES EXPANSÍVEIS)
       ========================================================================== */
    const headersAccordion = document.querySelectorAll(".accordion-header");
    
    headersAccordion.forEach(header => {
        header.addEventListener("click", () => {
            const item = header.parentElement;
            const content = header.nextElementSibling;
            const estaAtivo = item.classList.contains("ativo");
            
            // Fecha todos os itens abertos anteriormente (comportamento sanfona rígido)
            document.querySelectorAll(".accordion-item").forEach(outroItem => {
                outroItem.classList.remove("ativo");
                outroItem.querySelector(".accordion-header").setAttribute("aria-expanded", "false");
                const outroConteudo = outroItem.querySelector(".accordion-content");
                outroConteudo.style.maxHeight = null;
                outroConteudo.style.paddingTop = "0";
                outroConteudo.style.paddingBottom = "0";
                outroConteudo.setAttribute("aria-hidden", "true");
            });
            
            // Se o item clicado não estava ativo, abre ele
            if (!estaAtivo) {
                item.classList.add("ativo");
                header.setAttribute("aria-expanded", "true");
                content.style.maxHeight = content.scrollHeight + 40 + "px"; // Adiciona folga de padding
                content.style.paddingTop = "15px";
                content.style.paddingBottom = "20px";
                content.setAttribute("aria-hidden", "false");
            }
        });
    });

    /* ==========================================================================
       2. CONTROLE DE ACESSIBILIDADE FLUTUANTE
       ========================================================================== */
    let multiplicadorFonte = 1.0;
    const raizElemento = document.documentElement;
    
    const btnAumentar = document.getElementById("btn-aumentar");
    const btnDiminuir = document.getElementById("btn-diminuir");
    const btnTema = document.getElementById("btn-tema");
    const btnOuvir = document.getElementById("btn-ouvir");
    const btnParar = document.getElementById("btn-parar");
    
    // Aumentar e Diminuir Fonte
    btnAumentar.addEventListener("click", () => {
        if (multiplicadorFonte < 1.4) {
            multiplicadorFonte += 0.1;
            raizElemento.style.fontSize = `${multiplicadorFonte * 16}px`;
        }
    });
    
    btnDiminuir.addEventListener("click", () => {
        if (multiplicadorFonte > 0.8) {
            multiplicadorFonte -= 0.1;
            raizElemento.style.fontSize = `${multiplicadorFonte * 16}px`;
        }
    });
    
    // Alternar Modo Claro / Escuro
    btnTema.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        const icone = btnTema.querySelector(".icone-sol");
        if (document.body.classList.contains("dark-mode")) {
            icone.textContent = "🌙";
        } else {
            icone.textContent = "☀️";
        }
    });

    /* ==========================================================================
       3. TEXT-TO-SPEECH (SPEECHSYNTHESIS API ACCESSIBILITY)
       ========================================================================== */
    let sinteseFala = window.speechSynthesis;
    let expressaoUtterance = null;
    
    btnOuvir.addEventListener("click", () => {
        // Se já estiver tocando, cancela o anterior
        sinteseFala.cancel();
        
        // Coleta apenas o texto puramente semântico e principal da página
        const containerPrincipal = document.getElementById("conteudo-principal");
        
        // Clona para remover elementos interativos ou botões internos antes de ler
        const copiaLeitura = containerPrincipal.cloneNode(true);
        const elementosIgnorar = copiaLeitura.querySelectorAll("button, form, textarea, .form-comentario");
        elementosIgnorar.forEach(el => el.remove());
        
        const textoParaLer = copiaLeitura.innerText;
        
        if (textoParaLer.trim() !== "") {
            expressaoUtterance = new SpeechSynthesisUtterance(textoParaLer);
            expressaoUtterance.lang = "pt-BR";
            expressaoUtterance.rate = 1.0; // Velocidade ideal de fala humana
            
            expressaoUtterance.onstart = () => {
                btnOuvir.disabled = true;
                btnParar.disabled = false;
            };
            
            expressaoUtterance.onend = () => {
                btnOuvir.disabled = false;
                btnParar.disabled = true;
            };
            
            expressaoUtterance.onerror = () => {
                btnOuvir.disabled = false;
                btnParar.disabled = true;
            };
            
            sinteseFala.speak(expressaoUtterance);
        }
    });
    
    btnParar.addEventListener("click", () => {
        sinteseFala.cancel();
        btnOuvir.disabled = false;
        btnParar.disabled = true;
    });

    /* ==========================================================================
       4. INTERATIVIDADE E ENVIO DO FORMULÁRIO DO SEMINÁRIO
       ========================================================================== */
    const formSeminario = document.getElementById("form-seminario");
    const msgSucesso = document.getElementById("mensagem-sucesso");
    
    formSeminario.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const nome = document.getElementById("nome").value;
        
        // Simulação assíncrona de cadastro em banco de dados
        msgSucesso.className = "mensagem-sucesso sucesso";
        msgSucesso.innerHTML = `Parabéns, ${nome}! Sua inscrição para o Seminário Online AgroFuturo 2026 foi confirmada com sucesso. Verifique seu e-mail corporativo.`;
        
        formSeminario.reset();
        
        // Mantém foco acessível na mensagem de feedback positivo
        msgSucesso.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    /* ==========================================================================
       5. ÁREA DE COMENTÁRIOS DINÂMICA
       ========================================================================== */
    const formComentario = document.getElementById("form-comentario");
    const txtComentario = document.getElementById("txt-comentario");
    const listaComentarios = document.getElementById("lista-comentarios");
    
    formComentario.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const texto = txtComentario.value.trim();
        if (texto === "") return;
        
        // Criando elemento do novo comentário dinamicamente
        const cardComentario = document.createElement("div");
        cardComentario.className = "item-comentario";
        
        const pTexto = document.createElement("p");
        pTexto.textContent = texto;
        
        const spanMeta = document.createElement("span");
        spanMeta.className = "meta";
        
        const dataAtual = new Date().toLocaleDateString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        spanMeta.textContent = `Enviado por: Leitor Anônimo em ${dataAtual}`;
        
        cardComentario.appendChild(pTexto);
        cardComentario.appendChild(spanMeta);
        
        // Insere no topo da lista de interações
        listaComentarios.insertBefore(cardComentario, listaComentarios.firstChild);
        
        txtComentario.value = "";
    });
});