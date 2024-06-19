export class GithubRepositoryResponseDto {
  name: boolean;
  owner: {
    login: string;
  };
  private: boolean;
  size: number;

  firstYamlContent: string;
  filesCount: number;
}
