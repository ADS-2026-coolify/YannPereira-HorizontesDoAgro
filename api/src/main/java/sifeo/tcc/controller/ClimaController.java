package sifeo.tcc.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sifeo.tcc.models.dto.request.ClimaRequestDTO;
import sifeo.tcc.models.dto.response.ClimaResponseDTO;
import sifeo.tcc.service.ClimaService;

import java.util.List;

@RestController
@RequestMapping("/api/clima")
public class ClimaController {

    private final ClimaService service;

    public ClimaController(ClimaService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ClimaResponseDTO>> listar(
            @RequestParam(required = false) Integer sitioId) {
        return ResponseEntity.ok(service.listarPorSitio(sitioId));
    }

    @PostMapping
    public ResponseEntity<ClimaResponseDTO> cadastrar(@Valid @RequestBody ClimaRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.cadastrar(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClimaResponseDTO> atualizar(
            @PathVariable Integer id, @Valid @RequestBody ClimaRequestDTO dto) {
        return ResponseEntity.ok(service.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}