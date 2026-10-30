package sifeo.tcc.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sifeo.tcc.exception.model.RecursoNaoEncontradoException;
import sifeo.tcc.exception.model.RegraNegocioException;
import sifeo.tcc.models.entities.Setor;
import sifeo.tcc.models.entities.Sitio;
import sifeo.tcc.models.enums.StatusSetor;
import sifeo.tcc.models.dto.request.SetorRequestDTO;
import sifeo.tcc.models.dto.response.SetorResponseDTO;
import sifeo.tcc.repository.SetorRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SetorService {

    private final SetorRepository setorRepository;
    private final SitioService sitioService;
    private final AutenticacaoService autenticacaoService;

    public SetorService(SetorRepository setorRepository, SitioService sitioService, AutenticacaoService autenticacaoService) {
        this.setorRepository = setorRepository;
        this.sitioService = sitioService;
        this.autenticacaoService = autenticacaoService;
    }

    @Transactional
    public SetorResponseDTO cadastrarSetor(SetorRequestDTO dto) {
        Sitio sitio = sitioService.buscarSitioSeguro(dto.getSitioId());

        Setor setor = new Setor();
        setor.setSitio(sitio);
        setor.setNome(dto.getNome());
        setor.setHectares(dto.getHectares());
        setor.setPlantio(dto.getPlantio());
        setor.setObservacoes(dto.getObservacoes());
        setor.setStatus(StatusSetor.EM_PREPARO);
        setor.setDataEncerramento(null);

        Setor setorSalvo = setorRepository.save(setor);
        return mapearParaDTO(setorSalvo);
    }

    @Transactional(readOnly = true)
    public List<SetorResponseDTO> listarSetoresPorSitio(Integer sitioId) {
        sitioService.buscarSitioSeguro(sitioId);
        List<Setor> setores = setorRepository.findBySitioId(sitioId);
        return setores.stream().map(this::mapearParaDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SetorResponseDTO> listarTodos() {
        Integer usuarioId = autenticacaoService.usuarioLogado().getId();
        List<Setor> setores = setorRepository.findBySitio_Usuario_Id(usuarioId);
        return setores.stream().map(this::mapearParaDTO).collect(Collectors.toList());
    }

    @Transactional
    public SetorResponseDTO atualizarSetor(Integer id, SetorRequestDTO dto) {
        Setor setor = setorRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Setor não encontrado com o ID informado."));
        sitioService.validarPropriedadeDoUsuario(setor.getSitio());

        Sitio sitio = sitioService.buscarSitioSeguro(dto.getSitioId());

        setor.setNome(dto.getNome());
        setor.setHectares(dto.getHectares());
        setor.setPlantio(dto.getPlantio());
        setor.setObservacoes(dto.getObservacoes());
        setor.setSitio(sitio);

        if (dto.getStatus() != null) {
            setor.setStatus(dto.getStatus());
        }

        if (StatusSetor.ENCERRADO.equals(setor.getStatus())) {
            setor.setDataEncerramento(LocalDate.now());
        } else {
            setor.setDataEncerramento(null);
        }

        Setor setorAtualizado = setorRepository.save(setor);
        return mapearParaDTO(setorAtualizado);
    }

    @Transactional
    public void deletarSetor(Integer id) {
        Setor setor = setorRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Setor não encontrado para exclusão."));
        sitioService.validarPropriedadeDoUsuario(setor.getSitio());

        try {
            setorRepository.delete(setor);
            setorRepository.flush();
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw new RegraNegocioException("Não é possível excluir este setor pois existem registros vinculados a ele (atividades, documentos).");
        }
    }

    private SetorResponseDTO mapearParaDTO(Setor setor) {
        SetorResponseDTO dto = new SetorResponseDTO();
        dto.setId(setor.getId());
        dto.setNome(setor.getNome());
        dto.setHectares(setor.getHectares());
        dto.setPlantio(setor.getPlantio());
        dto.setStatus(setor.getStatus());
        dto.setDataEncerramento(setor.getDataEncerramento());

        if (setor.getSitio() != null) {
            dto.setNomePropriedade(setor.getSitio().getNome());
        }

        return dto;
    }
}
