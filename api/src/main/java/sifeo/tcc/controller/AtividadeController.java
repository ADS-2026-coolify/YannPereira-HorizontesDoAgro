package sifeo.tcc.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sifeo.tcc.models.dto.request.AtividadeRequestDTO;
import sifeo.tcc.service.AtividadeService;

@RestController
@RequestMapping("/api/atividades")
public class AtividadeController {

    private final AtividadeService service; 

    public AtividadeController(AtividadeService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<?> listarTodos(@RequestParam(required = false) Integer sitioId) {
        return ResponseEntity.ok(service.listarTodos(sitioId));
    }

    @PostMapping
    public ResponseEntity<?> cadastrar(@Valid @RequestBody AtividadeRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.cadastrar(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Integer id, @Valid @RequestBody AtividadeRequestDTO dto) {
        return ResponseEntity.ok(service.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}