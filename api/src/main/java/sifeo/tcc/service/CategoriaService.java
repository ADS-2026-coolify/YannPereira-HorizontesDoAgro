package sifeo.tcc.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sifeo.tcc.exception.model.RecursoNaoEncontradoException;
import sifeo.tcc.models.dto.request.CategoriaRequestDTO;
import sifeo.tcc.models.dto.response.CategoriaResponseDTO;
import sifeo.tcc.models.entities.Categoria;
import sifeo.tcc.repository.CategoriaRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public CategoriaService(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoriaResponseDTO> listarTodos() {
        return categoriaRepository.findAll().stream()
                .map(this::mapearParaDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public CategoriaResponseDTO cadastrar(CategoriaRequestDTO dto) {
        Categoria categoria = new Categoria();
        categoria.setNome(dto.getNome());
        categoria.setDescricao(dto.getDescricao());

        Categoria salva = categoriaRepository.save(categoria);
        return mapearParaDTO(salva);
    }

    @Transactional
    public CategoriaResponseDTO atualizar(Integer id, CategoriaRequestDTO dto) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria não encontrada com o ID informado."));

        categoria.setNome(dto.getNome());
        categoria.setDescricao(dto.getDescricao());

        Categoria atualizada = categoriaRepository.save(categoria);
        return mapearParaDTO(atualizada);
    }

    @Transactional
    public void deletar(Integer id) {
        if (!categoriaRepository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Categoria não encontrada para exclusão.");
        }
        categoriaRepository.deleteById(id);
    }

    private CategoriaResponseDTO mapearParaDTO(Categoria categoria) {
        CategoriaResponseDTO dto = new CategoriaResponseDTO();
        dto.setId(categoria.getId());
        dto.setNome(categoria.getNome());
        dto.setDescricao(categoria.getDescricao());
        return dto;
    }
}
