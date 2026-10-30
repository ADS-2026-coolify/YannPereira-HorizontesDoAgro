package sifeo.tcc.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sifeo.tcc.models.dto.request.TipoAtividadeRequestDTO;
import sifeo.tcc.models.dto.response.TipoAtividadeResponseDTO;
import sifeo.tcc.service.TipoAtividadeService;
import java.util.List;

    @RestController
    @RequestMapping("/api/tipos-atividade")
    public class TipoAtividadeController {
        private final TipoAtividadeService service;

        public TipoAtividadeController(TipoAtividadeService service) { this.service = service; }

        @GetMapping
        public ResponseEntity<List<TipoAtividadeResponseDTO>> listarTodos(@RequestParam Integer sitioId) {
            return ResponseEntity.ok(service.listarPorSitio(sitioId));
        }

        @PostMapping
        public ResponseEntity<TipoAtividadeResponseDTO> cadastrar(@Valid @RequestBody TipoAtividadeRequestDTO dto) {
            return ResponseEntity.status(HttpStatus.CREATED).body(service.cadastrar(dto));
        }

        @DeleteMapping("/{id}")
        public ResponseEntity<Void> deletar(@PathVariable Integer id) {
            service.deletar(id);
            return ResponseEntity.noContent().build();
        }
    }