export class GithubUrlParser {
  static parse(url: string): [string, string] {
    const path = url.replace('https://', '').replace('github.com/', '');
    const [owner, repo, ...rest] = path.split('/');
    return [owner, repo];
  }
}
