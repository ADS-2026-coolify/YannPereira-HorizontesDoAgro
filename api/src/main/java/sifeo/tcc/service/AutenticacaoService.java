package sifeo.tcc.service;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import sifeo.tcc.models.entities.Usuario;

@Service
public class AutenticacaoService {

    private final UsuarioService usuarioService;

    public AutenticacaoService(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    public Usuario usuarioLogado() {
        String login = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioService.buscarPorLogin(login);
    }
}
