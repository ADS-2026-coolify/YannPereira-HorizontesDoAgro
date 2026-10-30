package sifeo.tcc.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sifeo.tcc.models.dto.request.EquipamentoRequestDTO;
import sifeo.tcc.models.dto.response.EquipamentoResponseDTO;
import sifeo.tcc.service.EquipamentoService;

import java.util.List;

@RestController
@RequestMapping("/api/equipamentos")
public class EquipamentoController {

    private final EquipamentoService equipamentoService;

    public EquipamentoController(EquipamentoService equipamentoService) {
        this.equipamentoService = equipamentoService;
    }

    @GetMapping
    public ResponseEntity<List<EquipamentoResponseDTO>> listar(
            @RequestParam(required = false) Integer sitioId) {
        return ResponseEntity.ok(equipamentoService.listarTodos(sitioId));
    }

    @PostMapping
    public ResponseEntity<EquipamentoResponseDTO> cadastrar(
            @Valid @RequestBody EquipamentoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(equipamentoService.cadastrar(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EquipamentoResponseDTO> atualizar(
            @PathVariable Integer id,
            @Valid @RequestBody EquipamentoRequestDTO dto) {
        return ResponseEntity.ok(equipamentoService.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        equipamentoService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
