package sifeo.tcc.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import sifeo.tcc.models.dto.request.SitioRequestDTO;
import sifeo.tcc.models.dto.request.SitioResponseDTO;
import sifeo.tcc.models.entities.Usuario;
import sifeo.tcc.service.SitioService;
import sifeo.tcc.service.UsuarioService;

import java.util.List;

@RestController
@RequestMapping("/api/propriedades")
public class SitioController {

    @Autowired
    private SitioService sitioService;

    @Autowired
    private UsuarioService usuarioService;

    private Usuario getUsuarioLogado() {
        String loginUsuario = SecurityContextHolder.getContext().getAuthentication().getName();
        return this.usuarioService.buscarPorLogin(loginUsuario);
    }

    @GetMapping
    public ResponseEntity<List<SitioResponseDTO>> listarMinhasPropriedades() {
        Usuario usuario = getUsuarioLogado();
        List<SitioResponseDTO> lista = this.sitioService.listarSitiosDoUsuario(usuario.getId());
        return ResponseEntity.ok(lista);
    }

    @PostMapping
    public ResponseEntity<SitioResponseDTO> registrarPropriedade(@RequestBody @Valid SitioRequestDTO requestDTO) {
        Usuario usuario = getUsuarioLogado();
        SitioResponseDTO novaPropriedade = this.sitioService.criarSitio(requestDTO, usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(novaPropriedade);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SitioResponseDTO> atualizarPropriedade(@PathVariable Integer id, @RequestBody @Valid SitioRequestDTO requestDTO) {
        Usuario usuario = getUsuarioLogado();
        SitioResponseDTO propriedadeAtualizada = this.sitioService.atualizarSitio(id, requestDTO, usuario);
        return ResponseEntity.ok(propriedadeAtualizada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarPropriedade(@PathVariable Integer id) {
        Usuario usuario = getUsuarioLogado();
        this.sitioService.deletarSitio(id, usuario);
        return ResponseEntity.noContent().build(); 
    }
}