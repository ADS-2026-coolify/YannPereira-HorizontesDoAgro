package sifeo.tcc.security.service;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import sifeo.tcc.security.dto.LoginRequest;
import sifeo.tcc.security.dto.LoginResponse;
import sifeo.tcc.models.entities.Usuario;
import sifeo.tcc.repository.UsuarioRepository;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public LoginResponse autenticar(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadCredentialsException("Dados inválidos tente novamente"));

        if (!passwordEncoder.matches(request.senha(), usuario.getSenha())) {
            throw new BadCredentialsException("Dados inválidos tente novamente");
        }

        String tokenReal = jwtService.gerarToken(usuario);

        return new LoginResponse(tokenReal, usuario.getEmail(), usuario.getNomeCompleto());
    }
}