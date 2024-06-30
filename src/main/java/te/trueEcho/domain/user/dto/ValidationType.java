package te.trueEcho.domain.user.dto;

public enum ValidationType {

    EMAIL("email"),
    NICKNAME("nickname");

    private final String value;

    ValidationType(String value) {
        this.value = value;
    }

    public String getValue() {
        return this.value;
    }
}
