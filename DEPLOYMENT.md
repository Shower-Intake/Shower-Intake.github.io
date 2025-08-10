# Deployment Guide

This guide covers deploying the Shower Intake application using our CI/CD pipeline.

## 🚀 Quick Deploy

### Automatic Deployment (Recommended)

1. **Push to main/master branch**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Monitor GitHub Actions**
   - Go to Actions tab in your repository
   - Watch the "Deploy to GitHub Pages" workflow
   - Deployment happens automatically after successful build

### Manual Deployment

```bash
# Install dependencies and build
npm ci
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## 🔧 CI/CD Setup

### Prerequisites

1. **Repository Settings**
   - Enable GitHub Pages in repository settings
   - Set source to "GitHub Actions"
   - Ensure Pages permissions are enabled

2. **Required Permissions**
   - `contents: read` - Read repository content
   - `pages: write` - Deploy to GitHub Pages
   - `id-token: write` - GitHub OIDC token for authentication

### Workflow Configuration

The workflow (`.github/workflows/deploy.yml`) includes:

- **Build Job**: Installs dependencies, runs tests, builds app
- **Deploy Job**: Deploys to GitHub Pages (main/master only)
- **Concurrency Control**: Prevents multiple deployments

## 🧪 Local Testing

### Test CI/CD Pipeline Locally

```bash
# Run complete pipeline test
./test-ci.sh

# Test individual steps
npm ci                    # Install dependencies
npm run lint              # Linting
npm test                  # Tests
npm run build             # Build
```

### Test Build Output

```bash
# Build the application
npm run build

# Check build directory
ls -la build/

# Serve locally to test
npx serve -s build
```

## 📋 Deployment Checklist

Before deploying:

- [ ] All tests pass locally (`npm test`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Build output verified (`ls build/`)
- [ ] Changes committed and pushed
- [ ] GitHub Actions workflow enabled

## 🔍 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version (requires 16+)
   - Verify all dependencies installed
   - Check for linting errors

2. **Deployment Failures**
   - Ensure Pages permissions enabled
   - Check workflow file syntax
   - Verify branch name (main/master)

3. **Permission Errors**
   - Check repository settings
   - Verify GitHub Actions permissions
   - Ensure Pages source set to "GitHub Actions"

### Debug Commands

```bash
# Check Node.js version
node --version

# Verify dependencies
npm ls --depth=0

# Test build process
npm run build

# Check for linting issues
npm run lint
```

## 📊 Monitoring

### GitHub Actions

- **Build Status**: Check Actions tab for workflow runs
- **Deployment Logs**: View detailed logs for each step
- **Performance**: Monitor build times and success rates

### GitHub Pages

- **Deployment Status**: Check Pages tab for deployment info
- **Custom Domain**: Configure custom domain if needed
- **HTTPS**: Automatic HTTPS enabled by default

## 🔄 Rollback

If deployment fails or issues arise:

1. **Revert to Previous Commit**
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Manual Rollback**
   - Go to Pages settings
   - Revert to previous deployment
   - Investigate and fix issues

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [React Deployment Guide](https://create-react-app.dev/docs/deployment/)
- [GitHub OIDC Documentation](https://docs.github.com/en/actions/security-guides/automatic-token-authentication)

---

**Note**: This deployment guide assumes you have admin access to the repository. Contact repository administrators if you need assistance with permissions or settings.
