package sifeo.tcc.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sifeo.tcc.exception.model.RecursoNaoEncontradoException;
import sifeo.tcc.exception.model.RegraNegocioException;
import sifeo.tcc.models.dto.request.InsumoRequestDTO;
import sifeo.tcc.models.dto.response.InsumoResponseDTO;
import sifeo.tcc.models.entities.Insumo;
import sifeo.tcc.models.entities.Sitio;
import sifeo.tcc.repository.InsumoRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InsumoService {

    private final InsumoRepository insumoRepository;
    private final SitioService sitioService;
    private final AutenticacaoService autenticacaoService;

    public InsumoService(InsumoRepository insumoRepository, SitioService sitioService, AutenticacaoService autenticacaoService) {
        this.insumoRepository = insumoRepository;
        this.sitioService = sitioService;
        this.autenticacaoService = autenticacaoService;
    }

    @Transactional(readOnly = true)
    public List<InsumoResponseDTO> listarPorSitio(Integer sitioId) {
        if (sitioId == null) {
            Integer usuarioId = autenticacaoService.usuarioLogado().getId();
            return insumoRepository.findBySitio_Usuario_Id(usuarioId).stream().map(this::mapearParaDTO).collect(Collectors.toList());
        }
        sitioService.buscarSitioSeguro(sitioId);
        return insumoRepository.findBySitioId(sitioId).stream().map(this::mapearParaDTO).collect(Collectors.toList());
    }

    @Transactional
    public InsumoResponseDTO cadastrar(InsumoRequestDTO dto) {
        Sitio sitio = sitioService.buscarSitioSeguro(dto.getSitioId());

        Insumo insumo = new Insumo();
        insumo.setSitio(sitio);
        insumo.setNome(dto.getNome());
        insumo.setDescricao(dto.getDescricao());
        insumo.setQuantidadeEstoque(dto.getQuantidadeEstoque() != null ? dto.getQuantidadeEstoque() : 0.0);

        insumo.setCategoria(dto.getCategoria());
        insumo.setUnidadeMedida(dto.getUnidadeMedida());
        insumo.setFornecedor(dto.getFornecedor());

        insumo = insumoRepository.save(insumo);
        return mapearParaDTO(insumo);
    }

    @Transactional
    public InsumoResponseDTO atualizar(Integer id, InsumoRequestDTO dto) {
        Insumo insumo = insumoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Insumo não encontrado com ID: " + id));
        sitioService.validarPropriedadeDoUsuario(insumo.getSitio());

        insumo.setNome(dto.getNome());
        insumo.setDescricao(dto.getDescricao());
        if (dto.getQuantidadeEstoque() != null) {
            insumo.setQuantidadeEstoque(dto.getQuantidadeEstoque());
        }

        insumo.setCategoria(dto.getCategoria());
        insumo.setUnidadeMedida(dto.getUnidadeMedida());
        insumo.setFornecedor(dto.getFornecedor());

        insumo = insumoRepository.save(insumo);
        return mapearParaDTO(insumo);
    }

    @Transactional
    public void deletar(Integer id) {
        Insumo insumo = insumoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Insumo não encontrado com o ID: " + id));
        sitioService.validarPropriedadeDoUsuario(insumo.getSitio());

        try {
            insumoRepository.delete(insumo);
            insumoRepository.flush();
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw new RegraNegocioException("Não é possível excluir. O insumo possui vínculos ativos no sistema.");
        }
    }

    private InsumoResponseDTO mapearParaDTO(Insumo insumo) {
        InsumoResponseDTO dto = new InsumoResponseDTO();
        dto.setId(insumo.getId());
        dto.setNome(insumo.getNome());
        dto.setDescricao(insumo.getDescricao());
        dto.setQuantidadeEstoque(insumo.getQuantidadeEstoque());
        dto.setCategoria(insumo.getCategoria());
        dto.setUnidadeMedida(insumo.getUnidadeMedida());
        dto.setFornecedor(insumo.getFornecedor());

        if (insumo.getSitio() != null) {
            dto.setSitioId(insumo.getSitio().getId());
            dto.setPropriedadeNome(insumo.getSitio().getNome());
        }
        return dto;
    }
}
