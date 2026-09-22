# Security scan notes

The first `npm audit` run found vulnerable versions of Express, Mongoose, Joi,
Cloudinary and several indirect dependencies. The non-breaking packages were
updated with `npm audit fix`.

The old `multer-storage-cloudinary` package required a vulnerable Cloudinary
version. It was removed and replaced with a small upload function that uses the
current Cloudinary SDK directly. After these changes, `npm audit` reported zero
known vulnerabilities.

Trivy also identified denial-of-service findings in the older Multer upload
package and in the copy of npm bundled with the runtime image. Multer was
updated to the fixed major version. The final Docker image removes npm after
installing production packages because the running application does not need
it.

The Jenkins Security stage runs two checks:

1. `npm audit` checks the production Node.js dependencies.
2. Trivy checks the built Docker image for high and critical vulnerabilities.

Future findings should be recorded here with their severity, the chosen fix,
or a short explanation if a finding is accepted as a false positive.

Current verification result: both `npm audit` and the Trivy high/critical image
scan complete with zero findings.
