declare module "bplist-creator" {
  type PlistJsObj = any[] | Record<any, any>;

  type BPlistCreator = (object: PlistJsObj) => Buffer;

  export const BPlistCreator: BPlistCreator;
}
