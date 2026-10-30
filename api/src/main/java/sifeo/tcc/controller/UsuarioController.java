package sifeo.tcc.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import sifeo.tcc.models.dto.UsuarioPerfilDTO;
import sifeo.tcc.models.dto.request.PerfilRequestDTO;
import sifeo.tcc.models.dto.response.UsuarioResponseDTO;
import sifeo.tcc.models.entities.Usuario;
import sifeo.tcc.service.UsuarioService;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping("/informacao")
    public ResponseEntity<UsuarioPerfilDTO> obterPerfilUsuarioAtual() {

        String loginUsuario = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioService.buscarPorLogin(loginUsuario);

        UsuarioPerfilDTO perfilDTO = new UsuarioPerfilDTO(
                usuario.getId(),
                usuario.getNomeCompleto(),
                usuario.getNomeUsuario(),
                usuario.getEmail(),
                usuario.getCpf()
        );
        return ResponseEntity.ok(perfilDTO);
    }

    @PutMapping("/perfil")
    public ResponseEntity<UsuarioResponseDTO> atualizarPerfil(@Valid @RequestBody PerfilRequestDTO dto) {

        String loginUsuario = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuarioLogado = usuarioService.buscarPorLogin(loginUsuario);
        UsuarioResponseDTO perfilAtualizado = usuarioService.atualizarPerfil(dto, usuarioLogado);

        return ResponseEntity.ok(perfilAtualizado);
    }
}