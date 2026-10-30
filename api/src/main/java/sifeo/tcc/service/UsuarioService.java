package sifeo.tcc.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sifeo.tcc.exception.model.RegraNegocioException;
import sifeo.tcc.models.dto.request.PerfilRequestDTO;
import sifeo.tcc.models.dto.response.UsuarioResponseDTO;
import sifeo.tcc.models.entities.Usuario;
import sifeo.tcc.repository.UsuarioRepository;
import sifeo.tcc.security.dto.RegistroRequest;

@Service
public class UsuarioService {

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public void registrarNovoUsuario(RegistroRequest request) {

        String cpfLimpo = request.cpf().replaceAll("\\D", "");

        if (usuarioRepository.existsByEmail(request.email())) {
            throw new RegraNegocioException("Este e-mail já está cadastrado no sistema.");
        }

        if (usuarioRepository.existsByCpf(cpfLimpo)) {
            throw new RegraNegocioException("Este CPF já está vinculado a outra conta.");
        }

        Usuario novoUsuario = new Usuario();
        novoUsuario.setNomeCompleto(request.nomeCompleto());
        novoUsuario.setNomeUsuario(request.nomeUsuario());
        novoUsuario.setCpf(cpfLimpo);
        novoUsuario.setEmail(request.email());
        novoUsuario.setSenha(passwordEncoder.encode(request.senha()));

        usuarioRepository.save(novoUsuario);
    }

    public Usuario buscarPorLogin(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new sifeo.tcc.exception.model.RecursoNaoEncontradoException("Usuário não encontrado no sistema."));
    }

    private String extrairApenasNumeros(String valor) {
        if (valor == null || valor.trim().isEmpty()) {
            return null;
        }
        return valor.replaceAll("\\D", "");
    }

    public UsuarioResponseDTO atualizarPerfil(PerfilRequestDTO dto, Usuario usuarioLogado) {

        String cpfLimpo = extrairApenasNumeros(dto.getCpf());

        usuarioRepository.findByEmail(dto.getEmail())
                .filter(outro -> !outro.getId().equals(usuarioLogado.getId()))
                .ifPresent(outro -> { throw new RegraNegocioException("Este e-mail já está cadastrado em outra conta."); });

        if (cpfLimpo != null) {
            usuarioRepository.findByCpf(cpfLimpo)
                    .filter(outro -> !outro.getId().equals(usuarioLogado.getId()))
                    .ifPresent(outro -> { throw new RegraNegocioException("Este CPF já está vinculado a outra conta."); });
        }

        usuarioLogado.setNomeCompleto(dto.getNomeCompleto());
        usuarioLogado.setNomeUsuario(dto.getNomeUsuario());
        usuarioLogado.setEmail(dto.getEmail());
        usuarioLogado.setCpf(cpfLimpo);

        if (dto.getSenha() != null && !dto.getSenha().trim().isEmpty()) {
            usuarioLogado.setSenha(passwordEncoder.encode(dto.getSenha()));
        }

        Usuario usuarioSalvo = usuarioRepository.save(usuarioLogado);

        UsuarioResponseDTO responseDTO = new UsuarioResponseDTO();
        responseDTO.setId(usuarioSalvo.getId());
        responseDTO.setNomeCompleto(usuarioSalvo.getNomeCompleto());
        responseDTO.setNomeUsuario(usuarioSalvo.getNomeUsuario());
        responseDTO.setEmail(usuarioSalvo.getEmail());
        responseDTO.setCpf(usuarioSalvo.getCpf());

        return responseDTO;
    }
}