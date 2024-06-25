package te.trueEcho.infra.azure;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

@Component
public class EnvFileLoader {
    private static final Logger log = LoggerFactory.getLogger(EnvFileLoader.class);
    private final Environment env;

    public EnvFileLoader(Environment env) {
        this.env = env;
    }

    @PostConstruct
    public void loadEnv() {
        try {
            ClassPathResource resource = new ClassPathResource(".env");
            Path path = resource.getFile().toPath();
            List<String> lines = Files.readAllLines(path);
            for (String line : lines) {
                String[] parts = line.split("=", 2);
                if (parts.length == 2) {
                    System.setProperty(parts[0], parts[1]);
                }
            }
        } catch (IOException e) {
            log.error("Failed to load .env file", e);
        }
    }

    public String getEnv(String key) {
        String value = env.getProperty(key);
        log.info("Environment variable {} = {}", key, value);
        return value;
    }
}
