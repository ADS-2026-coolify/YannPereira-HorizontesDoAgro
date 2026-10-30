package sifeo.tcc.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sifeo.tcc.models.dto.request.InsumoRequestDTO;
import sifeo.tcc.models.dto.response.InsumoResponseDTO;
import sifeo.tcc.service.InsumoService;

import java.util.List;

@RestController
@RequestMapping("/api/insumos")
public class InsumoController {

    private final InsumoService service;

    public InsumoController(InsumoService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<InsumoResponseDTO>> listar(
            @RequestParam(required = false) Integer sitioId) {
        return ResponseEntity.ok(service.listarPorSitio(sitioId));
    }

    @PostMapping
    public ResponseEntity<InsumoResponseDTO> cadastrar(@Valid @RequestBody InsumoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.cadastrar(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InsumoResponseDTO> atualizar(
            @PathVariable Integer id, @Valid @RequestBody InsumoRequestDTO dto) {
        return ResponseEntity.ok(service.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}