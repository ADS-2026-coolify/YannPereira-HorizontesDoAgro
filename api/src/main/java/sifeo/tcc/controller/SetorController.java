package sifeo.tcc.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sifeo.tcc.models.dto.request.SetorRequestDTO;
import sifeo.tcc.models.dto.response.SetorResponseDTO;
import sifeo.tcc.service.SetorService;

import java.util.List;

@RestController
@RequestMapping("/api/setores")
public class SetorController {

    private final SetorService setorService;

    public SetorController(SetorService setorService) {
        this.setorService = setorService;
    }

    @PostMapping
    public ResponseEntity<SetorResponseDTO> cadastrarSetor(@Valid @RequestBody SetorRequestDTO dto) {
        SetorResponseDTO setorCriado = setorService.cadastrarSetor(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(setorCriado);
    }

    @GetMapping
    public ResponseEntity<List<SetorResponseDTO>> listar(
            @RequestParam(name = "sitioId", required = false) Integer sitioId) {
        List<SetorResponseDTO> setores;

        if (sitioId == null) {
            setores = this.setorService.listarTodos();
        } else {
            setores = this.setorService.listarSetoresPorSitio(sitioId);
        }
        return ResponseEntity.ok(setores);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SetorResponseDTO> atualizar(
            @PathVariable Integer id,
            @Valid @RequestBody SetorRequestDTO dto) {

        SetorResponseDTO setorAtualizado = this.setorService.atualizarSetor(id, dto);
        return ResponseEntity.ok(setorAtualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarSetor(@PathVariable Integer id) {
        setorService.deletarSetor(id);
        return ResponseEntity.noContent().build();
    }
}