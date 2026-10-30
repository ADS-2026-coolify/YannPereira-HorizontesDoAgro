package sifeo.tcc.service;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sifeo.tcc.exception.model.RecursoNaoEncontradoException;
import sifeo.tcc.exception.model.RegraNegocioException;
import sifeo.tcc.models.dto.request.TipoAtividadeRequestDTO;
import sifeo.tcc.models.dto.response.TipoAtividadeResponseDTO;
import sifeo.tcc.models.entities.Sitio;
import sifeo.tcc.models.entities.TipoAtividade;
import sifeo.tcc.repository.TipoAtividadeRepository;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TipoAtividadeService {
    private final TipoAtividadeRepository tipoRepository;
    private final SitioService sitioService;

    public TipoAtividadeService(TipoAtividadeRepository tipoRepository, SitioService sitioService) {
        this.tipoRepository = tipoRepository;
        this.sitioService = sitioService;
    }

    @Transactional(readOnly = true)
    public List<TipoAtividadeResponseDTO> listarPorSitio(Integer sitioId) {
        sitioService.buscarSitioSeguro(sitioId);
        return tipoRepository.findBySitioIdOrderByNomeAsc(sitioId).stream().map(tipo -> {
            TipoAtividadeResponseDTO dto = new TipoAtividadeResponseDTO();
            dto.setId(tipo.getId());
            dto.setNome(tipo.getNome());
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public TipoAtividadeResponseDTO cadastrar(TipoAtividadeRequestDTO dto) {
        Sitio sitio = sitioService.buscarSitioSeguro(dto.getSitioId());
        TipoAtividade tipo = new TipoAtividade();
        tipo.setSitio(sitio);
        tipo.setNome(dto.getNome().trim());
        tipo = tipoRepository.save(tipo);

        TipoAtividadeResponseDTO response = new TipoAtividadeResponseDTO();
        response.setId(tipo.getId());
        response.setNome(tipo.getNome());
        return response;
    }

    @Transactional
    public void deletar(Integer id) {
        TipoAtividade tipo = tipoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Tipo de atividade não encontrado para exclusão."));
        sitioService.validarPropriedadeDoUsuario(tipo.getSitio());

        try {
            tipoRepository.delete(tipo);
            tipoRepository.flush();
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw new RegraNegocioException("Não é possível excluir. Este tipo de atividade possui vínculos ativos no sistema.");
        }
    }
}
