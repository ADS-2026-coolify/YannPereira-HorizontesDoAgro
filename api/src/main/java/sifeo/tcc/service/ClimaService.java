package sifeo.tcc.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sifeo.tcc.exception.model.RecursoNaoEncontradoException;
import sifeo.tcc.models.dto.request.ClimaRequestDTO;
import sifeo.tcc.models.dto.response.ClimaResponseDTO;
import sifeo.tcc.models.entities.Clima;
import sifeo.tcc.models.entities.Sitio;
import sifeo.tcc.repository.ClimaRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ClimaService {

    private final ClimaRepository climaRepository;
    private final SitioService sitioService;
    private final AutenticacaoService autenticacaoService;

    public ClimaService(ClimaRepository climaRepository, SitioService sitioService, AutenticacaoService autenticacaoService) {
        this.climaRepository = climaRepository;
        this.sitioService = sitioService;
        this.autenticacaoService = autenticacaoService;
    }

    @Transactional(readOnly = true)
    public List<ClimaResponseDTO> listarPorSitio(Integer sitioId) {
        if (sitioId == null) {
            Integer usuarioId = autenticacaoService.usuarioLogado().getId();
            return climaRepository.findBySitio_Usuario_Id(usuarioId).stream().map(this::mapearParaDTO).collect(Collectors.toList());
        }
        sitioService.buscarSitioSeguro(sitioId);
        return climaRepository.findBySitioIdOrderByDataHoraDesc(sitioId).stream().map(this::mapearParaDTO).collect(Collectors.toList());
    }

    @Transactional
    public ClimaResponseDTO cadastrar(ClimaRequestDTO dto) {
        Sitio sitio = sitioService.buscarSitioSeguro(dto.getSitioId());

        Clima clima = new Clima();
        clima.setSitio(sitio);
        clima.setTempo(dto.getTempo());
        clima.setDescricao(dto.getDescricao());
        clima.setDataHora(dto.getDataHora());

        clima.setMilimetros(dto.getMilimetros() != null ? dto.getMilimetros() : BigDecimal.ZERO);

        clima = climaRepository.save(clima);
        return mapearParaDTO(clima);
    }

    @Transactional
    public ClimaResponseDTO atualizar(Integer id, ClimaRequestDTO dto) {
        Clima clima = climaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Registro climático não encontrado."));
        sitioService.validarPropriedadeDoUsuario(clima.getSitio());

        clima.setTempo(dto.getTempo());
        clima.setDescricao(dto.getDescricao());
        clima.setDataHora(dto.getDataHora());

        if (dto.getMilimetros() != null) {
            clima.setMilimetros(dto.getMilimetros());
        }

        clima = climaRepository.save(clima);
        return mapearParaDTO(clima);
    }

    @Transactional
    public void deletar(Integer id) {
        Clima clima = climaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Registro climático não encontrado."));
        sitioService.validarPropriedadeDoUsuario(clima.getSitio());
        climaRepository.delete(clima);
    }

    private ClimaResponseDTO mapearParaDTO(Clima clima) {
        ClimaResponseDTO dto = new ClimaResponseDTO();
        dto.setId(clima.getId());
        dto.setTempo(clima.getTempo());
        dto.setDescricao(clima.getDescricao());
        dto.setMilimetros(clima.getMilimetros());
        dto.setDataHora(clima.getDataHora());

        if (clima.getSitio() != null) {
            dto.setPropriedadeNome(clima.getSitio().getNome());
        }
        return dto;
    }
}
