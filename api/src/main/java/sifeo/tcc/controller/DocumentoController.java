package sifeo.tcc.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sifeo.tcc.models.dto.request.DocumentoRequestDTO;
import sifeo.tcc.models.dto.response.DocumentoResponseDTO;
import sifeo.tcc.models.entities.Documento;
import sifeo.tcc.service.DocumentoService;

import java.util.List;

@RestController
@RequestMapping("/api/documentos")
public class DocumentoController {

    private final DocumentoService documentoService;

    public DocumentoController(DocumentoService documentoService) {
        this.documentoService = documentoService;
    }

    @GetMapping
    public ResponseEntity<List<DocumentoResponseDTO>> listar(
            @RequestParam(name = "sitioId") Integer sitioId) {
        return ResponseEntity.ok(documentoService.listarPorSitio(sitioId));
    }

    @PostMapping
    public ResponseEntity<DocumentoResponseDTO> cadastrar(@Valid @RequestBody DocumentoRequestDTO dto) {
        DocumentoResponseDTO documentoCriado = documentoService.cadastrar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(documentoCriado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DocumentoResponseDTO> atualizar(
            @PathVariable Integer id,
            @Valid @RequestBody DocumentoRequestDTO dto) {
        return ResponseEntity.ok(documentoService.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        documentoService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/arquivo")
    public ResponseEntity<byte[]> baixarArquivo(@PathVariable Integer id) {
        Documento documento = documentoService.buscarParaDownload(id);

        MediaType tipo = documento.getTipoArquivo() != null
                ? MediaType.parseMediaType(documento.getTipoArquivo())
                : MediaType.APPLICATION_OCTET_STREAM;

        String nomeArquivo = documento.getNomeArquivo() != null ? documento.getNomeArquivo() : "documento";

        return ResponseEntity.ok()
                .contentType(tipo)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + nomeArquivo + "\"")
                .body(documento.getArquivo());
    }
}
