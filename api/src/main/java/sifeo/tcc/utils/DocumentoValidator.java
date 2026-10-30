package sifeo.tcc.utils;

public class DocumentoValidator {

    public static void validarCep(String cep) {
        if (cep == null || cep.trim().isEmpty()) return;

        String numeros = cep.replaceAll("\\D", "");
        if (numeros.length() != 8) {
            throw new IllegalArgumentException("O CEP informado é inválido. Deve conter 8 números.");
        }
    }

    public static void validarCpfCnpj(String documento) {
        if (documento == null || documento.trim().isEmpty()) return; 

        String numeros = documento.replaceAll("\\D", "");

        if (numeros.length() == 11) {
            if (!isCpfValido(numeros)) throw new IllegalArgumentException("O CPF informado é matematicamente inválido.");
        } else if (numeros.length() == 14) {
            if (!isCnpjValido(numeros)) throw new IllegalArgumentException("O CNPJ informado é matematicamente inválido.");
        } else {
            throw new IllegalArgumentException("O documento deve ter 11 (CPF) ou 14 (CNPJ) dígitos.");
        }
    }

    private static boolean isCpfValido(String cpf) {
        if (cpf.matches("(\\d)\\1{10}")) return false;
        try {
            int soma = 0, peso = 10;
            for (int i = 0; i < 9; i++) soma += (cpf.charAt(i) - '0') * peso--;
            int r = 11 - (soma % 11);
            char dig10 = (r == 10 || r == 11) ? '0' : (char) (r + '0');

            soma = 0; peso = 11;
            for (int i = 0; i < 10; i++) soma += (cpf.charAt(i) - '0') * peso--;
            r = 11 - (soma % 11);
            char dig11 = (r == 10 || r == 11) ? '0' : (char) (r + '0');

            return (dig10 == cpf.charAt(9)) && (dig11 == cpf.charAt(10));
        } catch (Exception e) {
            return false;
        }
    }

    private static boolean isCnpjValido(String cnpj) {
        if (cnpj.matches("(\\d)\\1{13}")) return false;
        try {
            int soma = 0, peso = 2;
            for (int i = 11; i >= 0; i--) {
                soma += (cnpj.charAt(i) - '0') * peso;
                peso = (peso == 9) ? 2 : peso + 1;
            }
            int r = soma % 11;
            char dig13 = (r == 0 || r == 1) ? '0' : (char) ((11 - r) + '0');

            soma = 0; peso = 2;
            for (int i = 12; i >= 0; i--) {
                soma += (cnpj.charAt(i) - '0') * peso;
                peso = (peso == 9) ? 2 : peso + 1;
            }
            r = soma % 11;
            char dig14 = (r == 0 || r == 1) ? '0' : (char) ((11 - r) + '0');

            return (dig13 == cnpj.charAt(12)) && (dig14 == cnpj.charAt(13));
        } catch (Exception e) {
            return false;
        }
    }
}